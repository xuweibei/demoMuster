import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { message, Modal, Form, Row, Col, Input, Select, Button, Icon, DatePicker, InputNumber, Table, Pagination, Tree, Card } from 'antd';
const dateFormat = 'YYYY-MM-DD';
//组件实例模板方法引入
import { searchFormItemLayout24, searchFormItemLayout, searchFormItemLayout16, loadBizDictionary, onSearch } from '@/utils/componentExt';
import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime, formatMoment } from '@/utils';
import { loadDictionary } from '@/actions/dic';
import SelectArea from '@/components/BizSelect/SelectArea';
import SelectItem from '@/components/BizSelect/SelectItem';
import ContentBox from '@/components/ContentBox';
import EditableTeacherMain from '@/components/EditableTeacherMain';
//业务接口方法引入
import { qryById } from '@/actions/recruit';
import { getUniversityByBranchId, selectUserByAreaId, getActivityDetail, selectNowRecruitBatch } from '@/actions/base';
import EditableUniversityTagGroup from '@/components/EditableUniversityTagGroup';

const FormItem = Form.Item;
const { TextArea } = Input;
const btnformItemLayout = {
    wrapperCol: { span: 24 },
};


/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class AddActivityView extends React.Component {
    constructor(props) {
        super(props)
        this.loadBizDictionary = loadBizDictionary.bind(this);
        this.onSearch = onSearch.bind(this);
        this.state = {
            dataModel: '',//数据模型
            activityId: props.currentDataModel.activityId,
            pagingSearch: {
                isUniversity: 1,
                regionId: '',

            },
            dic_University_list: [],
            isUniversity: true,
            user_list: [],
            itemIds: [],//选中的项目
            teacherInfo: []
        };
    }
    componentWillMount() {
        //载入需要的字典项
        this.loadBizDictionary(['sex', 'dic_YesNo', 'activity_type']);
        
        //首次进入搜索，加载服务端字典项内容
        this.onSearch();
        if(this.props.editMode == 'Edit' ){
            if(this.props.currentDataModel.universityId){
                this.fetchUniversity();
                this.setState({
                    isUniversity: true
                })
            }else{
                this.setState({
                    isUniversity: false
                })
            }
            
        }
    }
    componentWillReceiveProps(nextProps) {
        if ('submitLoading' in nextProps) {
          this.setState({
            loading: nextProps.submitLoading,
          });
        }
    }
    //检索数据
    fetch = () => {
        if (this.props.editMode == 'Create') {
            this.props.selectNowRecruitBatch().payload.promise.then((response) => {
                let data = response.payload.data;
                if (data.state === 'success') {
                    this.setState({
                        pagingSearch: {
                            recruitBatchId: data.data.recruitBatchId, recruitBatchName: data.data.recruitBatchName, isUniversity: 1,
                            regionId: '',
                        }, loading: false
                    })
                }
                else {
                    this.setState({ loading: false })
                    message.error(data.message);
                    this.onCancel()
                }
            })
        }

        if (this.state.activityId) {
            this.setState({ loading: true });
            var condition = {
                activityId: this.state.activityId,
            }
            this.setState({ dataModel: '' })
            this.props.getActivityDetail(condition).payload.promise.then((response) => {
                let data = response.payload.data;
                if (data.state === 'success') {
                    var teacherInfo = [];
                    if(data.data.teacherId){
                        teacherInfo.push({
                            id: data.data.teacherId,
                            name: this.props.currentDataModel.teacherName
                        })
                    }
                    this.setState({
                        teacherInfo: teacherInfo
                    })
                    this.setState({ pagingSearch: condition, dataModel: data.data, loading: false })
                    this.state.pagingSearch.regionId = data.data.regionId;
                    this.fetchUser();
                }
                else {
                    this.setState({ loading: false })
                    message.error(data.message);
                    this.onCancel()
                }
            })
        }

    }

    fetchUser = (params = {}) => {
        this.props.selectUserByAreaId({ areaId: this.state.pagingSearch.regionId }).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.result === false) {
                message.error(data.message);
            }
            else {
                this.setState({ user_list: data.data })
            }
        })
    }

    fetchUniversity = () => {
        var that = this;
        let condition = {};

        this.props.getUniversityByBranchId(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'success') {
                var list = [];
                data.data.map(item => {
                    list.push({
                        universityId: item.universityId,
                        universityName: item.universityName
                    });
                })
                that.setState({ dic_University_list: list })

            }
            else {
                message.error(data.message);
            }
        })
    }

    onUniversityChoose(value, name) {

        var p = this.state.pagingSearch;

        if (value && value.length && value[0].id) {
            if (name == "universityId") {
                p[name] = value[0].id;
            }

        } else {
            p[name] = '';
        }
        this.setState({
            pagingSearch: p
        })
    }

    onCancel = () => {
        this.props.viewCallback();
    }
    onSubmit = () => {
        //表单验证后，合并数据提交
        this.props.form.validateFields((err, values) => {
            if (values.universityId == "") {
                message.warning("请选择高校")
                return;
            }
            if (!err) {
                
                this.props.setSubmitLoading(true);

                if(values.teacherId.length) values.teacherId = values.teacherId[0].id;

                if (this.props.editMode == 'Create') {
                    this.props.viewCallback({
                        ...values,
                        recruitBatchId: this.state.pagingSearch.recruitBatchId,
                        startTime: formatMoment(values.startTime, 'YYYY-MM-DD HH:mm:ss'),
                        endTime: formatMoment(values.endTime, 'YYYY-MM-DD HH:mm:ss'),
                        activityId: this.state.activityId,
                        universityId: values.universityId ? values.universityId[0].id : ''

                    });//合并保存数据
                } else {
                    this.props.viewCallback({
                        ...values,
                        recruitBatchId: this.props.currentRecruitBatch.value,
                        startTime: formatMoment(values.startTime, 'YYYY-MM-DD HH:mm:ss'),
                        endTime: formatMoment(values.endTime, 'YYYY-MM-DD HH:mm:ss'),
                        activityId: this.state.activityId,
                        universityId: values.universityId ? values.universityId[0].id : ''

                    });//合并保存数据
                }
            }
        });
    }

    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode);
        return `${op}活动`;
    }
    //表单按钮处理
    renderBtnControl() {
        if (this.props.editMode != 'View') {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>{getViewEditModeTitle(this.props.editMode)}</Button>
                <span className="split_button"></span>
                <Button icon="rollback" onClick={this.onCancel} >取消</Button>
            </FormItem>
        }
        else {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button onClick={this.onCancel} icon="rollback">返回</Button>
            </FormItem>
        }
    }
    //多种模式视图处理
    renderEditModeOfView() {
        let block_content = <div></div>
        const { getFieldDecorator } = this.props.form;

        switch (this.props.editMode) {
            case "Create":

                block_content = (
                    <Form>
                        <Row gutter={24}>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'招生季'} >
                                    {this.state.pagingSearch.recruitBatchName}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'区域'} >
                                    {
                                        getFieldDecorator('regionId', {
                                            initialValue: '',
                                            rules: [{
                                                required: true, message: '请选择区域!',
                                            }]
                                        })
                                            (
                                            <SelectArea scope='my' hideAll={true} isFirstSelected={true} showCheckBox={false}
                                                onSelectChange={(value, selectedOptions) => {

                                                    this.state.pagingSearch.regionId = value;
                                                    // let currentCoursePlanBatch = selectedOptions;
                                                    // this.setState({ pagingSearch: this.state.pagingSearch, currentCoursePlanBatch });
                                                    this.fetchUser();

                                                }}
                                            />
                                            )
                                    }
                                </FormItem>
                            </Col>
                        </Row>
                        <Row gutter={24}>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout16}
                                    label="高校活动"
                                >
                                    <div className='dv_col1' style={{ width: 60 }}>{
                                        getFieldDecorator('isUniversity', {
                                            initialValue: dataBind(this.state.pagingSearch.isUniversity),
                                            rules: [{
                                                required: (this.state.isUniversity === true), message: '请选择是否高校活动!',
                                            }]
                                        })(
                                            <Select onChange={(value) => {
                                                if (value == 1) {
                                                    this.setState({ isUniversity: true })
                                                } else {
                                                    this.setState({ isUniversity: false })
                                                }
                                            }}>
                                                {this.state.dic_YesNo.map((item, index) => {
                                                    return <Option value={item.value} key={index}>{item.title}</Option>
                                                })}
                                            </Select>
                                        )}</div>
                                    <div className='dv_col2'>
                                        
                                        {this.state.isUniversity && getFieldDecorator('universityId', {
                                            initialValue: dataBind(this.state.pagingSearch.universityId),
                                            rules: [{
                                                required: (this.state.isUniversity === true), message: '请选择高校!',
                                            }]
                                        })(
                                            <EditableUniversityTagGroup maxTags={1}
                                                onChange={(value) => this.onUniversityChoose(value, 'universityId')}
                                            />
                                        )}
                                    </div>
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'活动名称'} >
                                    {getFieldDecorator('activityName', {
                                        initialValue: '',
                                        rules: [{
                                            required: true, message: '请输入活动名称!',
                                        }]
                                    })(
                                        <Input placeholder='请输入活动名称' />
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <Row gutter={24}>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'活动类型'} >
                                    {getFieldDecorator('activityType', {
                                        initialValue: '',
                                        rules: [{
                                            required: true, message: '请选择活动类型!',
                                        }]
                                    })(
                                        <Select>
                                            <Option value="">全部</Option>
                                            {this.state.activity_type.map((item, index) => {
                                                return <Option value={item.value} key={index}>{item.title}</Option>
                                            })}
                                        </Select>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'实际费用(￥)'} >
                                    {getFieldDecorator('costAmount', {
                                        initialValue: '',
                                        rules: [{
                                            required: true, message: '请输入实际费用!',
                                        }]
                                    })(
                                        <InputNumber min={0.01} step={0.01} precision='2' />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'活动开始时间'} >

                                    {getFieldDecorator('startTime', {
                                        initialValue: '',
                                        rules: [{
                                            required: true, message: '请选择活动开始时间!',
                                        }]
                                    })(
                                        <DatePicker className="ant-calendar-picker_time" placeholder='开始时间' format="YYYY/MM/DD HH:mm:ss" showTime={{ format: 'HH:mm' }} />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'活动结束时间'} >
                                    {getFieldDecorator('endTime', {
                                        initialValue: '',
                                        rules: [{
                                            required: true, message: '请选择活动结束时间!',
                                        }]
                                    })(
                                        <DatePicker className="ant-calendar-picker_time" placeholder='结束时间' format="YYYY/MM/DD HH:mm:ss" showTime={{ format: 'HH:mm' }} />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'负责人'} >
                                    {getFieldDecorator('chargeUserId', { initialValue: '' })(
                                        <Select>
                                            <Option value=''>--请选择--</Option>
                                            {this.state.user_list.map((item, index) => {
                                                return <Option value={item.userId} key={index}>{item.realName}</Option>
                                            })}
                                        </Select>
                                    )}
                                </FormItem>
                            </Col>
                            
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'主讲教师'} >
                                    {getFieldDecorator('teacherId', { 
                                        initialValue: 
                                        (!this.state.teacherInfo.length ? [] : [{
                                            id: this.state.teacherInfo[0].id,
                                            name: this.state.teacherInfo[0].name
                                        }]) 
                                        })(
                                    <EditableTeacherMain  maxTags={1} />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'转化意向人数'} >
                                    {getFieldDecorator('conversionCount', {
                                        initialValue: '',
                                        
                                    })(
                                        <InputNumber min={0} step={1} precision={0} />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={12}></Col>

                            <Col span={24}>
                                <FormItem {...searchFormItemLayout24} label={'项目'} >
                                    {getFieldDecorator('itemIds', {
                                        initialValue: ''
                                    })(
                                        <SelectItem scope={'my'} hideAll={true} showCheckBox={true} />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={24}>
                                <FormItem {...searchFormItemLayout24} label={'备注'} >
                                    {getFieldDecorator('remark', {
                                        initialValue: ''
                                    })(
                                        <TextArea placeholder='请输入备注' rows={2} />
                                    )}
                                </FormItem>
                            </Col>

                        </Row>
                    </Form>
                );
                break;
            case "Edit":
                block_content = (
                    <Form>
                        <Row gutter={24}>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'招生季'} >
                                    {this.props.currentRecruitBatch.title}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'区域'} >
                                    {
                                        getFieldDecorator('regionId', {
                                            initialValue: dataBind(this.state.dataModel.regionId),
                                            rules: [{
                                                required: true, message: '请选择区域!',
                                            }]
                                        })
                                            (
                                            <SelectArea scope='my' hideAll={true} showCheckBox={false}
                                                onSelectChange={(value, selectedOptions) => {

                                                    this.state.pagingSearch.regionId = value;
                                                    // let currentCoursePlanBatch = selectedOptions;
                                                    // this.setState({ pagingSearch: this.state.pagingSearch, currentCoursePlanBatch });
                                                    this.fetchUser();

                                                }}
                                            />
                                            )
                                    }
                                </FormItem>
                            </Col>
                        </Row>
                        <Row gutter={24}>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout16}
                                    label="高校活动"
                                >
                                    <div className='dv_col1' style={{ width: 60 }}>{
                                        getFieldDecorator('isUniversity', {
                                            initialValue: dataBind(this.state.dataModel.isUniversity),
                                            rules: [{
                                                required: (this.state.isUniversity === true), message: '请选择是否高校活动!',
                                            }]
                                        })(
                                            <Select onChange={(value) => {
                                                if (value == 1) {
                                                    this.setState({ isUniversity: true })
                                                } else {
                                                    this.setState({ isUniversity: false })
                                                }
                                            }}>
                                                {this.state.dic_YesNo.map((item, index) => {
                                                    return <Option value={item.value} key={index}>{item.title}</Option>
                                                })}
                                            </Select>
                                        )}</div>
                                    <div className='dv_col2'>
                                        
                                        {this.state.isUniversity && getFieldDecorator('universityId', {
                                            initialValue: !this.props.currentDataModel.universityId?[]:[{
                                                id:this.props.currentDataModel.universityId,
                                                name:this.props.currentDataModel.universityName
                                            }],
                                            rules: [{
                                                required: (this.state.isUniversity === true), message: '请选择高校!',
                                            }]
                                        })(
                                            <EditableUniversityTagGroup maxTags={1}
                                                onChange={(value) => this.onUniversityChoose(value, 'universityId')}
                                            />
                                        )}
                                    </div>
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'活动名称'} >
                                    {getFieldDecorator('activityName', {
                                        initialValue: this.state.dataModel.activityName,
                                        rules: [{
                                            required: true, message: '请输入活动名称!',
                                        }]
                                    })(
                                        <Input placeholder='请输入活动名称' />
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <Row gutter={24}>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'活动类型'} >
                                    {getFieldDecorator('activityType', {
                                        initialValue: dataBind(this.state.dataModel.activityType),
                                        rules: [{
                                            required: true, message: '请选择活动类型!',
                                        }]
                                    })(
                                        <Select>
                                            <Option value="">全部</Option>
                                            {this.state.activity_type.map((item, index) => {
                                                return <Option value={item.value} key={index}>{item.title}</Option>
                                            })}
                                        </Select>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'实际费用(￥)'} >
                                    {getFieldDecorator('costAmount', {
                                        initialValue: this.state.dataModel.costAmount,
                                        rules: [{
                                            required: true, message: '请输入实际费用!',
                                        }]
                                    })(
                                        <InputNumber min={0.01} step={0.01} precision='2' />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'活动开始时间'} >

                                    {getFieldDecorator('startTime', {
                                        initialValue: dataBind(timestampToTime(this.state.dataModel.startTimeStr), true),
                                        rules: [{
                                            required: true, message: '请选择活动开始时间!',
                                        }]
                                    })(
                                        <DatePicker className="ant-calendar-picker_time" placeholder='开始时间' format="YYYY/MM/DD HH:mm:ss" showTime={{ format: 'HH:mm' }} />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'活动结束时间'} >
                                    {getFieldDecorator('endTime', {
                                        initialValue: dataBind(timestampToTime(this.state.dataModel.endTimeStr), true),
                                        rules: [{
                                            required: true, message: '请选择活动结束时间!',
                                        }]
                                    })(
                                        <DatePicker className="ant-calendar-picker_time" placeholder='结束时间' format="YYYY/MM/DD HH:mm:ss" showTime={{ format: 'HH:mm' }} />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'负责人'} >
                                    {getFieldDecorator('chargeUserId', { initialValue: dataBind(this.state.dataModel.chargeUserId) })(
                                        <Select>
                                            <Option value=''>请选择</Option>
                                            {this.state.user_list.map((item, index) => {
                                                return <Option value={item.userId} key={index}>{item.realName}</Option>
                                            })}
                                        </Select>
                                    )}
                                </FormItem>
                            </Col>

                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'主讲教师'} >
                                    {getFieldDecorator('teacherId', { 
                                        initialValue: 
                                        (!this.state.teacherInfo.length ? [] : [{
                                            id: this.state.teacherInfo[0].id,
                                            name: this.state.teacherInfo[0].name
                                        }]) 
                                        })(
                                    <EditableTeacherMain  maxTags={1} />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'转化意向人数'} >
                                    {getFieldDecorator('conversionCount', {
                                        initialValue: this.state.dataModel.conversionCount,
                                        
                                    })(
                                        <InputNumber min={0} step={1} precision={0} />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={12}></Col>

                            <Col span={24}>
                                <FormItem {...searchFormItemLayout24} label={'项目'} >
                                    {getFieldDecorator('itemIds', {
                                        initialValue: this.state.dataModel.itemIds,
                                    })(
                                        <SelectItem scope={'my'} hideAll={true} showCheckBox={true} />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={24}>
                                <FormItem {...searchFormItemLayout24} label={'备注'} >
                                    {getFieldDecorator('remark', {
                                        initialValue: this.state.dataModel.remark
                                    })(
                                        <TextArea rows={2} />
                                    )}
                                </FormItem>
                            </Col>

                        </Row>
                    </Form>
                );
                break;
        }
        return block_content;
    }

    render() {
        let title = this.getTitle();
        let block_editModeView = this.renderEditModeOfView();
        return (
            <ContentBox titleName={title} bottomButton={this.renderBtnControl()}>
                <div className="dv_split"></div>
                {block_editModeView}
                <div className="dv_split"></div>
            </ContentBox>
        );
    }
}

const WrappedAddActivityView = Form.create()(AddActivityView);
const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};
function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        //各业务接口
        getActivityDetail: bindActionCreators(getActivityDetail, dispatch),//根据活动id查询活动详情
        selectNowRecruitBatch: bindActionCreators(selectNowRecruitBatch, dispatch),//获取最新招生季
        qryById: bindActionCreators(qryById, dispatch),
        getUniversityByBranchId: bindActionCreators(getUniversityByBranchId, dispatch),
        selectUserByAreaId: bindActionCreators(selectUserByAreaId, dispatch),

    };
}

export default connect(mapStateToProps, mapDispatchToProps)(WrappedAddActivityView);
