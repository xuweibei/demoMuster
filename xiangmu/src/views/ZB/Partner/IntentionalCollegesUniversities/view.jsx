 
import React from 'react'; 
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'; 
import { Modal, message, Form, Row, Col, Table, Input, Button, Icon, DatePicker, InputNumber, Select, Checkbox, Spin, Radio } from 'antd';
import moment from 'moment';
import ContentBox from '@/components/ContentBox';
import SelectFBOrg from '@/components/BizSelect/SelectFBOrg';
import AreasSelect from '@/components/AreasSelect';
const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;
const RadioGroup = Radio.Group;
const { TextArea } = Input;
const btnformItemLayout = {
    wrapperCol: { span: 24 },
};

import { getViewEditModeTitle, dataBind, timestampToTime, formatMoney, getDictionaryTitle, convertTextToHtml, split } from '@/utils';
const dateFormat = 'YYYY-MM-DD';
import EditableUniversityTagGroup from '@/components/EditableUniversityTagGroup';

import { 
    partnerProductPriceApplySearchZPriceForPartner,IntentionalCollegesUniversitiesEdit
} from '@/actions/partner';
 
//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, searchFormItemLayout24, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
 
class ProductPriceApplyView extends React.Component {
    constructor(props) {
        super(props);
        //扩展方法用于本组件实例
        this.loadBizDictionary = loadBizDictionary.bind(this);

        this.state = {
            dataModel: props.currentDataModel,//数据模型
            universityArr:props.currentDataModel.intentionUniversitiesId?[{id:props.currentDataModel.intentionUniversitiesId,name:props.currentDataModel.intentionUniversityName}]:'',
            pagingSearch: {
                currentPage: 1,
                pageSize: 999,
                productName: '',
                recruitBatchId: '',
                itemId: '',
                classTypeId: '',
                productType: '',
            },
            data: [],//商品列表
            product_price_list: [],//商品价格明细列表
            all_CourseCategorys: [],//所有科目
            PartnerContractList: [],//合同列表
            dic_fenqi: [1, 2, 3, 4].map((item, index) => {
                return { id: item, money: 0, courseCategoryIds: [] }
            }),
            currentFenQi: 4,//分期数
            _currentFenQi: 4,//分期数
            tableLoading: false,
            dic_partnerClassTypes: [],//字典
        };

        console.log(this.state.dataModel)
    }

    componentWillMount() {
        //加载字典数据
        this.loadBizDictionary(['parter_university_level', 'university_category', 'consume_ability', 'study_ability']);  
    }

    //检索数据
    fetchZbProductList(condition) { 
        this.props.partnerProductPriceApplySearchZPriceForPartner(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'success') {
                this.setState({
                    pagingSearch: condition,
                    ...data,
                })
            }
            else {
                message.error(data.message);
            }
        })
    }
  
    onCancel = () => {
        //如果有修改，则返回时强制刷新列表
        this.props.viewCallback();
    }
 
    onSubmit = (isAudit) => {
        var that = this;
        //表单验证后，合并数据提交
        this.props.form.validateFields((err, values) => {
            if (!err) { 
                if(Array.isArray(values.province)){
                    values.provinceId = values.province[0];
                    values.cityId = values.province[1];
                }else{  
                    values.provinceId = values.province;
                    values.cityId = this.state.dataModel.cityId;
                } 
                if(Array.isArray(values.intentionUniversity)){
                    values.intentionUniversityName = values.intentionUniversity[0].name
                }
                values.intentionUniversitiesId = this.props.currentDataModel.intentionUniversitiesId;
                delete values.province;
                delete values.intentionUniversity; 
                this.setState({loading:true})
                this.props.IntentionalCollegesUniversitiesEdit(values).payload.promise.then((response) => {
                    let data = response.payload.data; 
                    if (data.state === 'success') {  
                      this.props.viewCallback(true); 
                    }
                    else {
                      message.error(data.message);
                    }
                    this.setState({ loading: false })
                  })  
            }
        });
    } 
    //标题
    getTitle() { 
        return `编辑`;
    }
    //表单按钮处理
    renderBtnControl() { 
        return <FormItem
            className='btnControl'
            {...btnformItemLayout}
        >
                <Button type="primary" loading={this.state.loading} icon="save" onClick={() => { this.onSubmit(0) }}>保存</Button> 
                <span className="split_button"></span>
                <Button icon="rollback" onClick={this.onCancel} >返回</Button>
        </FormItem>  
    }

    //多种模式视图处理
    renderEditModeOfView() { 
        let block_content = <div></div>
        const { getFieldDecorator } = this.props.form;
        switch (this.props.editMode) { 
            case "Edit": 
                block_content = (
                    <Form>
                        <Row gutter={24}>
                            <Col span={12}>
                                    <FormItem
                                        {...searchFormItemLayout}
                                        label="高校名称"
                                    >
                                            {getFieldDecorator('intentionUniversity', { initialValue:  !this.state.universityArr?[]:[{
                                                    id:this.state.universityArr[0].id,
                                                    name:this.state.universityArr[0].name
                                                }],
                                                rules: [{ required: true, message: '请输入高校名称!' }],
                                            })(
                                                <EditableUniversityTagGroup maxTags={1} 
                                                // onChange={(value) => {
                                                //     if (value.length > 0) {
                                                //         let id = value[0].id
                                                //         this.fetchCampusList(id);
                                                //     }
                                                //     else {
                                                //         this.setState({ dic_Campus: [] })
                                                //     }
                                                //     setTimeout(() => {
                                                //         this.props.form.resetFields(['studyCampusId']);
                                                //     }, 500);
                                                // }} 
                                                />
                                            )}
                                    </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="合作意向学院">
                                    {getFieldDecorator('intentionDepartment', {
                                        initialValue: this.state.dataModel.intentionDepartment
                                    })( 
                                         <Input placeholder='请输入合作意向学院' />
                                        )}
                                </FormItem>
                            </Col>  
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="所在城市">
                                {getFieldDecorator('province', {
                                    initialValue: dataBind(this.state.dataModel.provinceId),
                                    rules: [{ required: true, message: '请选择城市!' }],
                                    })(
                                    <AreasSelect
                                        value={this.state.dataModel.provinceId}
                                        areaName={this.state.dataModel.provinceName+this.state.dataModel.cityName}
                                    />
                                )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="所属分公司">
                                    {getFieldDecorator('branchId', {
                                        initialValue: this.state.dataModel.branchId,
                                        rules: [{ required: true, message: '请选择分公司!' }],
                                    })(
                                        <SelectFBOrg scope={'my'} hideAll={false} />
                                        )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="开发/维护负责人">
                                    {getFieldDecorator('developUserName', {
                                        initialValue: this.state.dataModel.developUserName
                                    })( 
                                         <Input placeholder='请输入开发/维护负责人' />
                                        )}
                                </FormItem>
                            </Col>  
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'高校层次'} >
                                    {getFieldDecorator('universityLevel', { 
                                        initialValue: dataBind(this.state.dataModel.universityLevel), 
                                        rules: [{ required: true, message: '请选择高校层次!' }],
                                     })(
                                    <Select>
                                        <Option value='' key=''>全部</Option>
                                        {
                                            this.state.parter_university_level.map(item=>{
                                            return <Option value={item.value} >{item.title}</Option>
                                            })
                                        } 
                                    </Select>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                            <FormItem {...searchFormItemLayout} label={'高校类别'} >
                                {getFieldDecorator('universityCategory', {
                                     initialValue: dataBind(this.state.dataModel.universityCategory), 
                                     rules: [{ required: true, message: '请选择高校类别!' }],
                                     })(
                                <Select>
                                    <Option value='' key=''>全部</Option>
                                    {
                                        this.state.university_category.map(item=>{
                                        return <Option value={item.value} >{item.title}</Option>
                                        })
                                    } 
                                </Select>
                                )}
                            </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="对口专业规模">
                                    {getFieldDecorator('counterpartMajorNum', {
                                        initialValue: this.state.dataModel.counterpartMajorNum
                                    })( 
                                         <Input placeholder='请输入对口专业规模' />
                                        )}
                                </FormItem>
                            </Col> 
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="年度营业额">
                                    {getFieldDecorator('yearAmount', {
                                        initialValue: this.state.dataModel.yearAmount
                                    })( 
                                         <Input placeholder='请输入年度营业额' />
                                        )}
                                </FormItem>
                            </Col> 
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="消费能力判断">
                                    {getFieldDecorator('consumeAbility', {
                                        initialValue: dataBind(this.state.dataModel.consumeAbility)
                                    })( 
                                        <Select>
                                            <Option value='' key=''>全部</Option>
                                            {
                                                this.state.consume_ability.map(item=>{ 
                                                return <Option value={item.value} >{item.title}</Option>
                                                })
                                            } 
                                        </Select>
                                        )}
                                </FormItem>
                            </Col> 
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="学习能力判断">
                                    {getFieldDecorator('studyAbility', {
                                        initialValue: dataBind(this.state.dataModel.studyAbility)
                                    })( 
                                        <Select>
                                            <Option value='' key=''>全部</Option>
                                            {
                                                this.state.study_ability.map(item=>{
                                                return <Option value={item.value} >{item.title}</Option>
                                                })
                                            } 
                                        </Select>
                                        )}
                                </FormItem>
                            </Col> 
                            <Col span={24}> <span style={{color:'red',marginLeft:'7%'}}>低 - 生活费1000元/月以下; 中 - 生活费1000元/月-2000元/月; 高 - 2000元/月以上</span></Col> 
                            <Col span={24}>
                                <FormItem {...searchFormItemLayout24} label="备注">
                                    {getFieldDecorator('remark', {
                                        initialValue: this.state.dataModel.remark
                                    })( 
                                         <TextArea />
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
        //对应编辑模式
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

const WrappedView = Form.create()(ProductPriceApplyView);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        partnerProductPriceApplySearchZPriceForPartner: bindActionCreators(partnerProductPriceApplySearchZPriceForPartner, dispatch), 
        IntentionalCollegesUniversitiesEdit: bindActionCreators(IntentionalCollegesUniversitiesEdit, dispatch), 
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedView);
