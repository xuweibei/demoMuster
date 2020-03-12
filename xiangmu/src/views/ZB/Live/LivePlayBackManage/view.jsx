
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Table, Input, Button, Icon, DatePicker, InputNumber, Radio } from 'antd';
import moment from 'moment';
import ContentBox from '@/components/ContentBox';
const FormItem = Form.Item;
const { TextArea } = Input;
const RadioGroup = Radio.Group;
const btnformItemLayout = {
    wrapperCol: { span: 24 },
};

const searchFormItemLayout18 = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
};
const searchFormItemLayout20 = {
    labelCol: { span: 4 },
    wrapperCol: { span: 20 },
};

import { getViewEditModeTitle, dataBind, timestampToTime, formatMoney, getDictionaryTitle, formatMoment } from '@/utils';

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, searchFormItemLayout24, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';

import { queryLiveReplays } from '@/actions/live';

class LivePlayBackView extends React.Component {
    constructor(props) {
        super(props);
        //扩展方法用于本组件实例
        this.loadBizDictionary = loadBizDictionary.bind(this);

        this.state = {
            dataModel: props.currentDataModel,//数据模型
            data: [{
                liveReplayName: '',
                ccid: '',
                siteId: 'D550E277598F7D23',
            }],
            isFlag: true,
            isHasDate: false,
            showBtn: false
        };
    }

    componentWillMount() {
        
        this.queryLiveReplays();

    }

    onCancel = () => {
        //如果有修改，则返回时强制刷新列表
        this.props.viewCallback();
    }
    onSubmit = () => {
        var that = this;
        //表单验证后，合并数据提交
        this.props.form.validateFields((err, values) => {
            if (!err) {
                that.setState({ loading: true });
                setTimeout(() => {
                    that.setState({ loading: false });
                }, 3000);//合并保存数据

                let params = {};
                params.liveId = this.state.dataModel.liveId;

                // if(this.state.data.length < 1){
                //     message.error('请输入回放视频信息！');
                //     return;
                // }
                let liveReplayNames = [], ccids = [], orderNos = [], siteIds = [];
                this.state.data.map((item,index)=> {
                    liveReplayNames.push(item.liveReplayName);
                    ccids.push(item.ccid);
                    orderNos.push(index);
                    siteIds.push(item.siteId);
                })

                params.liveReplayNames = liveReplayNames.join(",");
                params.ccids = ccids.join(",");
                params.orderNos = orderNos.join(",");//用于后台排序
                params.siteIds = siteIds.join(",");
                
                that.props.viewCallback(params);

            }
        });
    }
    queryLiveReplays = () => {
        if(this.state.dataModel.liveId){
            this.props.queryLiveReplays({liveId:this.state.dataModel.liveId}).payload.promise.then((response) => {
              let data = response.payload.data;
              if (data.state === 'success') {
                
                this.setState({
                  showBtn: true,
                })

                if(data.data.length){
                    let replayData = [];
                    data.data.map((item) => {
                        replayData.push({
                            liveReplayName: item.liveReplayName,
                            ccid: item.ccid,
                            siteId: item.siteId,
                        })
                    })
                    this.setState({
                      data: replayData,
                      isHasDate: true,
                    })
                }else{
                    this.setState({
                      isFlag: false,
                    })
                }
              }
              else {
                this.setState({
                  showBtn: true,
                })
                message.error(data.message);
              }
            })
        }
    }
    changeName = (e,index) => {
        let value = e.target.value;
        let data = this.state.data;
        data[index].liveReplayName = value;
        this.setState({
          data: data
        })
    }
    changeCCID = (e,index) => {
        let value = e.target.value;
        let data = this.state.data;
        data[index].ccid = value;
        this.setState({
          data: data
        })
    }
    //编辑
    onEdit = () => {
        this.setState({
          isHasDate: false
        })
    }
    //新增
    onCreate = () => {
        let data = this.state.data;
        data.push({
            liveReplayName: '',
            ccid: '',
            siteId: 'D550E277598F7D23',
        })
        this.props.form.resetFields();
        this.setState({
          data: data,
          isFlag: true
        })
    }
    //删除
    onDeltet = (index) => {
        
        if(index == 0 && this.state.dataModel.replayMsg == "已上传" && this.state.data.length == 1 ){
            Modal.confirm({
                title: '是否删除最后一条直播回放视频?',
                content: '点击确认删除所选视频!否则点击取消！',
                onOk: () => {
                    let data = this.state.data;
                    data.splice(index,1);
                    this.props.form.resetFields();
                    this.setState({
                      data: data,
                    })

                    let params = {};
                    params.liveId = this.state.dataModel.liveId;
                    params.liveReplayNames = "";
                    params.ccids = "";
                    params.orderNos = "";//用于后台排序
                    params.siteIds = "";
                    
                    this.props.viewCallback(params);

                    this.onCreate();
                }
            })

        }else{
            let data = this.state.data;
            data.splice(index,1);
            this.props.form.resetFields();
            this.setState({
              data: data,
            })
        }
    }
    //上移
    onPrev = (index) => {
        if(index == 0){
            return;
        }
        let data = this.state.data;

        let temp = data[index];
        data[index] = data[index-1];
        data[index-1] = temp;
        this.props.form.resetFields();
        this.setState({
          data: data,
        })
    }

    //下移
    onNext = (index) => {
        if(index == (this.state.data.length - 1)){
            return;
        }
        let data = this.state.data;

        let temp = data[index];
        data[index] = data[index+1];
        data[index+1] = temp;
        this.props.form.resetFields();
        this.setState({
          data: data,
        })
    }
    
    //标题
    getTitle() {
        //加载最新的数据
        let op = `${this.props.editMode == 'Edit' ? '编辑' : '添加'}`
        
        return `${op}直播回放`;
        
    }
    //表单按钮处理
    renderBtnControl() {
        if (this.props.editMode == 'View') {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button onClick={this.onCancel} icon="rollback">返回</Button>
            </FormItem>
        }
        return <FormItem
            className='btnControl'
            {...btnformItemLayout}
            span={24}
        >
            <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>{getViewEditModeTitle(this.props.editMode)}</Button>
            <span className="split_button"></span>
            <Button icon="rollback" onClick={this.onCancel} style={{ marginLeft: 8 }} >取消</Button>
        </FormItem>

    }

    //多种模式视图处理
    renderEditModeOfView_CourseProduct() {
        let block_content = <div></div>
        const { getFieldDecorator } = this.props.form;
        switch (this.props.editMode) {
            case "Create":
            case "Edit":
                block_content = (
                    <Form>
                        {
                            this.state.data.map((item,index) => {
                                return <Row gutter={24}>
                                    <Col span={8}>
                                      {
                                        !this.state.isHasDate ?
                                        <FormItem {...searchFormItemLayout18} label={'名称'} >
                                        {getFieldDecorator('liveReplayName'+index, { 
                                            initialValue: item.liveReplayName,
                                            rules: [{
                                                required: true, message: '请输入视频名称!',
                                            }]
                                         })(
                                          <Input placeholder="视频名称" onChange={(...arg) => { this.changeName(...arg,index) }}/>
                                        )}
                                      </FormItem>
                                      :
                                      <FormItem {...searchFormItemLayout18} label={'名称'} >
                                        { item.liveReplayName }
                                      </FormItem>
                                      }
                                      
                                    </Col>
                                    <Col span={10}>
                                      {
                                        !this.state.isHasDate ?
                                        <FormItem {...searchFormItemLayout20} label={'CCID'} >
                                            {getFieldDecorator('ccid'+index, { 
                                                initialValue: item.ccid,
                                                rules: [{
                                                    required: true, message: '请输入视频CCID！',
                                                }]
                                             })(
                                              <Input placeholder="视频CCID" onChange={(...arg) => { this.changeCCID(...arg,index) }}/>
                                            )}
                                          </FormItem>
                                      :
                                        <FormItem {...searchFormItemLayout20} label={'CCID'} >
                                           { item.ccid }
                                          </FormItem>
                                      }
                                      
                                    </Col>
                                    {
                                        this.state.showBtn && 
                                        <Col span={6}>
                                            {//上移
                                                (!this.state.isHasDate && this.state.isFlag) ? <Icon style={{fontSize: '26px',cursor:'pointer',padding:'0 5px'}} type='arrow-up' onClick={() => { this.onPrev(index); }}></Icon>
                                                : ''
                                            }
                                            {//下移
                                                (!this.state.isHasDate && this.state.isFlag) ? <Icon style={{fontSize: '26px',cursor:'pointer',padding:'0 5px'}} type='arrow-down' onClick={() => { this.onNext(index); }}></Icon>
                                                 : ''
                                            }
                                            {//删除
                                                (!this.state.isHasDate && this.state.isFlag) ? <Icon style={{fontSize: '26px',cursor:'pointer',padding:'0 5px'}} type='close' onClick={() => { this.onDeltet(index); }}></Icon>
                                                 :  ''
                                            }
                                            {//新增
                                                (!this.state.isHasDate && index == this.state.data.length-1) ? <Icon style={{fontSize: '26px',cursor:'pointer',padding:'0 5px'}} type='plus' onClick={() => { this.onCreate(); }}></Icon>
                                                 : ''
                                            }
                                            {//编辑
                                                (this.state.isHasDate && (index == this.state.data.length-1)) ? <div style={{display:'inline-block'}}>
                                                     <Icon style={{fontSize: '23px',cursor:'pointer',padding:'0 5px'}} type='form' onClick={() => { this.onEdit(); }}></Icon>
                                               </div> : ''
                                            }
                                        </Col>
                                    }
                                    
                                </Row>
                            })
                        }
                            
                    </Form>
                );
                break;
            case "View":
                block_content = (
                    <Form>
                        
                    </Form>
                );
                break;
        }
        return block_content;
    }

    render() {
        let title = this.getTitle();
        //对应编辑模式
        let block_editModeView = this.renderEditModeOfView_CourseProduct();
        return (
            <ContentBox titleName={title} bottomButton={this.renderBtnControl()}>
                <div className="dv_split"></div>
                {block_editModeView}
                <div className="dv_split"></div>
            </ContentBox>
        );
    }
}

const WrappedView = Form.create()(LivePlayBackView);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        queryLiveReplays: bindActionCreators(queryLiveReplays, dispatch),
        
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedView);
